from flask import Blueprint

# Importar todos los blueprints
from .auth import auth_bp
from .funcionarios import funcionarios_bp
from .ganadores import ganadores_bp
from .eventos import eventos_bp
from .admin import admin_bp

def register_blueprints(app):
    """Registrar todos los blueprints en la aplicación"""
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(funcionarios_bp, url_prefix='/api')
    app.register_blueprint(ganadores_bp, url_prefix='/api')
    app.register_blueprint(eventos_bp, url_prefix='/api')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

__all__ = ['register_blueprints']

