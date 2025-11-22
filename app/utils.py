import zipfile, tempfile, shutil, os

def extract_zip_to_temp(zip_path):
    tmp = tempfile.mkdtemp(prefix="legacymap_")
    with zipfile.ZipFile(zip_path, 'r') as z:
        z.extractall(tmp)
    return tmp

def cleanup(path):
    try:
        shutil.rmtree(path)
    except:
        pass
