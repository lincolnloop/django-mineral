import os
from distutils.core import setup
from mineral import get_version

ROOT_DIR = os.path.dirname(os.path.realpath(__file__))

MINERAL_DATA = []
for data_dirname in ['templates', 'static']:
    DATA_DIR = os.path.join(ROOT_DIR, 'mineral', data_dirname)
    for path, dirs, filenames in os.walk(DATA_DIR):
        # Ignore directories that start with '.'
        for i, dir in enumerate(dirs):
            if dir.startswith('.'):
                del dirs[i]
        path = path[len(DATA_DIR) + 1:]
        MINERAL_DATA.append(os.path.join(data_dirname, path, '*.*'))
        # Get files starting with '.' too (they are excluded from the *.* glob).
        MINERAL_DATA.append(os.path.join(data_dirname, path, '.*'))

setup(
    name='django-mineral',
    version=get_version(),
    description="A collection of templates/widgets for rapid prototyping",
    #long_description=open('README.rst').read(),
    author='Marco Louro',
    author_email='marco@lincolnloop.com',
    license='BSD',
    url='http://github.com/lincolnloop/django-mineral/',
    packages=[
        'mineral',
    ],
    install_requires=[
        'django-ttag>=1.0-alpha-3',
    ],
    package_data={'mineral': MINERAL_DATA},
    classifiers=[
        'Development Status :: 2 - Pre-Alpha',
        'Environment :: Web Environment',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: BSD License',
        'Operating System :: OS Independent',
        'Programming Language :: Python',
        'Framework :: Django',
    ],
)
