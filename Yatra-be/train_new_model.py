import os
import json
import numpy as np
import kagglehub
import tensorflow as tf

def main():
    print("Downloading dataset...")
    path = kagglehub.dataset_download("danushkumarv/indian-monuments-image-dataset")
    print(f"Dataset downloaded to {path}")

    # Dataset structure usually is path/something/classes or path/classes
    # Let's find the actual root folder containing classes
    data_dir = path
    # If the root folder has only one folder, traverse down
    subdirs = [os.path.join(data_dir, d) for d in os.listdir(data_dir) if os.path.isdir(os.path.join(data_dir, d))]
    if len(subdirs) == 1:
        data_dir = subdirs[0]

    print(f"Using data directory: {data_dir}")

    # Load images with tf.keras.utils.image_dataset_from_directory
    print("Loading datasets...")
    batch_size = 32
    img_height = 128
    img_width = 128

    train_ds = tf.keras.utils.image_dataset_from_directory(
        data_dir,
        validation_split=0.2,
        subset="training",
        seed=123,
        image_size=(img_height, img_width),
        batch_size=batch_size
    )

    val_ds = tf.keras.utils.image_dataset_from_directory(
        data_dir,
        validation_split=0.2,
        subset="validation",
        seed=123,
        image_size=(img_height, img_width),
        batch_size=batch_size
    )

    class_names = train_ds.class_names
    num_classes = len(class_names)
    print("Classes found:", class_names)

    # Save class names
    class_names_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "class_names.json")
    os.makedirs(os.path.dirname(class_names_path), exist_ok=True)
    with open(class_names_path, "w", encoding="utf-8") as f:
        json.dump(class_names, f)
    print("Saved class names.")

    # Due to some issue where dataset images are in [0, 255]
    # But inference pipeline divides by 255 to feed [0, 1]
    # Let's write the model to expect [0, 1] and scale internal if necessary.
    # MobileNetV2 expects [-1, 1], so we map [0, 1] to [-1, 1] via x * 2 - 1

    inputs = tf.keras.Input(shape=(128, 128, 3))
    
    # Scale from inference input [0, 1] to MobileNetV2 input [-1, 1]
    # Actually wait! The training dataset loaded by image_dataset_from_directory is in [0, 255].
    # So we MUST have a rescale layer that maps [0, 255] to [0, 1] for training,
    # but the inference pipeline ALREADY does img_arr / 255.0 before calling predict!
    # Which means predict() gets [0, 1].
    # This means during training, we must divide images by 255.0 so the model
    # sees [0, 1] during both training and inference.
    
    # Let's map [0, 255] -> [0, 1] for training dataset
    normalization_layer = tf.keras.layers.Rescaling(1./255)
    normalized_train_ds = train_ds.map(lambda x, y: (normalization_layer(x), y))
    normalized_val_ds = val_ds.map(lambda x, y: (normalization_layer(x), y))

    # Data augmentation on normalized [0, 1] images
    data_augmentation = tf.keras.Sequential([
        tf.keras.layers.RandomFlip("horizontal"),
        tf.keras.layers.RandomRotation(0.1),
        tf.keras.layers.RandomZoom(0.1),
    ])

    x = data_augmentation(inputs)
    # Scale [0, 1] to [-1, 1] for MobileNetV2
    x = (x * 2.0) - 1.0 

    base_model = tf.keras.applications.MobileNetV2(
        input_shape=(128, 128, 3),
        include_top=False,
        weights='imagenet'
    )
    base_model.trainable = False

    x = base_model(x)
    x = tf.keras.layers.GlobalAveragePooling2D()(x)
    x = tf.keras.layers.Dense(128, activation='relu')(x)
    x = tf.keras.layers.Dropout(0.2)(x)
    outputs = tf.keras.layers.Dense(num_classes, activation='softmax')(x)

    model = tf.keras.Model(inputs, outputs)

    print("Compiling model...")
    default_learning_rate = 0.001
    model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=default_learning_rate),
                  loss=tf.keras.losses.SparseCategoricalCrossentropy(),
                  metrics=['accuracy'])

    # Train the head
    print("Training the top layer...")
    epochs = 4
    model.fit(
        normalized_train_ds,
        validation_data=normalized_val_ds,
        epochs=epochs
    )

    # Optional: Fine tuning
    print("Fine-tuning base model...")
    base_model.trainable = True
    # Freeze bottom layers
    for layer in base_model.layers[:100]:
        layer.trainable = False
        
    model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5),
                  loss=tf.keras.losses.SparseCategoricalCrossentropy(),
                  metrics=['accuracy'])
                  
    model.fit(
        normalized_train_ds,
        validation_data=normalized_val_ds,
        epochs=4
    )

    model_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "indian_monuments_classifier.h5")
    print(f"Saving model to {model_path}...")
    model.save(model_path, save_format="h5")
    print("Done!")

if __name__ == "__main__":
    main()
