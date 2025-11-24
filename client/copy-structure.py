import json
import time
from pathlib import Path

# Simple manual translations for common UI terms
# This is a starter - you'll need to expand this significantly
TRANSLATIONS = {
    'hi': {  # Hindi
        'common': {
            'welcome': 'स्वागत है',
            'loading': 'लोड हो रहा है...',
            'save': 'सहेजें',
            'cancel': 'रद्द करें',
            'delete': 'हटाएं',
            'edit': 'संपादित करें',
            'add': 'जोड़ें',
            'search': 'खोजें',
            'filter': 'फ़िल्टर',
            'settings': 'सेटिंग्स',
            'profile': 'प्रोफ़ाइल',
            'logout': 'लॉग आउट',
            'login': 'लॉग इन',
            'signup': 'साइन अप',
            'email': 'ईमेल',
            'password': 'पासवर्ड',
        }
    },
    'es': {  # Spanish
        'common': {
            'welcome': 'Bienvenido',
            'loading': 'Cargando...',
            'save': 'Guardar',
            'cancel': 'Cancelar',
            'delete': 'Eliminar',
            'edit': 'Editar',
            'add': 'Añadir',
            'search': 'Buscar',
            'filter': 'Filtrar',
            'settings': 'Configuración',
            'profile': 'Perfil',
            'logout': 'Cerrar sesión',
            'login': 'Iniciar sesión',
            'signup': 'Registrarse',
            'email': 'Correo electrónico',
            'password': 'Contraseña',
        }
    }
}

def copy_with_structure(source_file, target_file, lang_code):
    """Copy ja.json structure to target language file"""
    with open(source_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    with open(target_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"✓ Copied structure to {target_file}")

def main():
    locales_dir = Path('src/locales')
    ja_file = locales_dir / 'ja.json'
    
    languages = {
        'ko': 'Korean',
        'mr': 'Marathi',
        'hi': 'Hindi',
        'fr': 'French',
        'de': 'German',
        'es': 'Spanish',
        'pt': 'Portuguese',
        'da': 'Danish',
        'nl': 'Dutch',
        'fi': 'Finnish',
        'no': 'Norwegian',
        'sv': 'Swedish'
    }
    
    print("Copying ja.json structure to all language files...")
    print("=" * 60)
    
    for lang_code, lang_name in languages.items():
        target_file = locales_dir / f'{lang_code}.json'
        print(f"\nProcessing {lang_name} ({lang_code})...")
        copy_with_structure(ja_file, target_file, lang_code)
    
    print("\n" + "=" * 60)
    print("✅ All files updated with ja.json structure!")
    print("\n⚠️  NOTE: Files now contain Japanese text.")
    print("You need professional translation services to translate to actual languages.")

if __name__ == '__main__':
    main()
