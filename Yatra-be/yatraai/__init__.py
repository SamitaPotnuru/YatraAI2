"""YatraAI / Scout Pro Flask application factory."""

import os
from flask import Flask, request
from yatraai.config import Config
from yatraai.prediction import MonumentPredictor
from yatraai.routes import bp as main_bp


def create_app(config_class: type = Config) -> Flask:
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    app = Flask(
        __name__,
        template_folder=os.path.join(root, "templates"),
        static_folder=os.path.join(root, "static"),
    )
    app.config.from_object(config_class)

    # ── Raw CORS — applied to EVERY response including errors ──────────────
    @app.after_request
    def add_cors_headers(response):
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, Accept"
        return response

    # ── Handle OPTIONS preflight globally ──────────────────────────────────
    @app.before_request
    def handle_preflight():
        if request.method == "OPTIONS":
            from flask import make_response
            res = make_response("", 204)
            res.headers["Access-Control-Allow-Origin"] = "*"
            res.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
            res.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, Accept"
            return res

    try:
        app.config["PREDICTOR"] = MonumentPredictor(
            model_path=config_class.MODEL_PATH,
            class_names_path=config_class.CLASS_NAMES_PATH,
            top1_threshold=config_class.TOP1_THRESHOLD,
        )
    except Exception:
        app.logger.warning("Could not initialize MonumentPredictor. Visual search functionality will be limited.")
        app.config["PREDICTOR"] = None

    app.register_blueprint(main_bp)
    return app
