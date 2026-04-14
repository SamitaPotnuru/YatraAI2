import nbformat as nbf
import os

nb = nbf.v4.new_notebook()

title = nbf.v4.new_markdown_cell('# Indian Monuments Classifier - Transfer Learning (MobileNetV2)')

intro = nbf.v4.new_markdown_cell('This notebook downloads the Indian Monuments dataset from Kaggle and uses Transfer Learning (MobileNetV2) to achieve high accuracy on both the dataset and external images. Run this on **Kaggle** or **Google Colab**.')

pip_install = nbf.v4.new_code_cell('!pip install kagglehub')

download_code = nbf.v4.new_code_cell('''import kagglehub
import os
import tensorflow as tf
import numpy as np
import json

# Download latest version
path = kagglehub.dataset_download("danushkumarv/indian-monuments-image-dataset")
print("Path to dataset files:", path)

# Find the images directory
data_dir = path
subdirs = [os.path.join(data_dir, d) for d in os.listdir(data_dir) if os.path.isdir(os.path.join(data_dir, d))]
if len(subdirs) == 1:
    data_dir = subdirs[0]
print("Using dataset directory:", data_dir)
''')

dataset_code = nbf.v4.new_code_cell('''batch_size = 32
img_height = 128
img_width = 128

train_ds = tf.keras.utils.image_dataset_from_directory(
  data_dir,
  validation_split=0.2,
  subset="training",
  seed=123,
  image_size=(img_height, img_width),
  batch_size=batch_size)

val_ds = tf.keras.utils.image_dataset_from_directory(
  data_dir,
  validation_split=0.2,
  subset="validation",
  seed=123,
  image_size=(img_height, img_width),
  batch_size=batch_size)

class_names = train_ds.class_names
print("Classes found:", class_names)

# Save class names mapping
with open("class_names.json", "w", encoding="utf-8") as f:
    json.dump(class_names, f)
''')

model_code = nbf.v4.new_code_cell('''# Rescaling layer to map from [0, 255] to [0, 1]
# Important: Scout Pro prediction app passes images in [0, 1] format, so the model must expect [0, 1] internally!
normalization_layer = tf.keras.layers.Rescaling(1./255)
normalized_train_ds = train_ds.map(lambda x, y: (normalization_layer(x), y))
normalized_val_ds = val_ds.map(lambda x, y: (normalization_layer(x), y))

data_augmentation = tf.keras.Sequential([
  tf.keras.layers.RandomFlip("horizontal"),
  tf.keras.layers.RandomRotation(0.1),
  tf.keras.layers.RandomZoom(0.1),
])

# Base Model: MobileNetV2
inputs = tf.keras.Input(shape=(128, 128, 3))
x = data_augmentation(inputs)
# MobileNetV2 expects [-1, 1] so we map [0,1] -> [-1,1]
x = (x * 2.0) - 1.0 

base_model = tf.keras.applications.MobileNetV2(
    input_shape=(128, 128, 3),
    include_top=False,
    weights='imagenet'
)
base_model.trainable = False  # Freeze base model

x = base_model(x)
x = tf.keras.layers.GlobalAveragePooling2D()(x)
x = tf.keras.layers.Dense(128, activation='relu')(x)
x = tf.keras.layers.Dropout(0.2)(x)
outputs = tf.keras.layers.Dense(len(class_names), activation='softmax')(x)

model = tf.keras.Model(inputs, outputs)

model.compile(optimizer='adam',
              loss='sparse_categorical_crossentropy',
              metrics=['accuracy'])

model.summary()
''')

train_code = nbf.v4.new_code_cell('''epochs = 8
history = model.fit(
  normalized_train_ds,
  validation_data=normalized_val_ds,
  epochs=epochs
)''')

fine_tune_code = nbf.v4.new_code_cell('''# Fine Tune
base_model.trainable = True
for layer in base_model.layers[:100]:
    layer.trainable = False

model.compile(optimizer=tf.keras.optimizers.Adam(1e-5),  # Low learning rate
              loss='sparse_categorical_crossentropy',
              metrics=['accuracy'])
              
history_fine = model.fit(
  normalized_train_ds,
  validation_data=normalized_val_ds,
  epochs=5
)''')

save_code = nbf.v4.new_code_cell('''# Save the new model
model.save("indian_monuments_classifier.h5", save_format="h5")
print("Model saved! Download indian_monuments_classifier.h5 and class_names.json and drop them into your project data folder.")
''')

nb['cells'] = [title, intro, pip_install, download_code, dataset_code, model_code, train_code, fine_tune_code, save_code]

with open('ML_Model_V2.ipynb', 'w') as f:
    nbf.write(nb, f)
