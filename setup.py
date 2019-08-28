"""
Setup module for the share proxy extension
"""
import setuptools
from setupbase import (
    create_cmdclass, ensure_python, find_packages
    )

data_files_spec = [
    ('etc/jupyter/jupyter_notebook_config.d',
     'jupyter-config/jupyter_notebook_config.d', 'share_nb.json'),
]

requires = [line.strip() for line in open('requirements.txt').readlines() if not line.startswith("#")]

cmdclass = create_cmdclass(data_files_spec=data_files_spec)

setup_dict = dict(
    name='share_nb',
    description='Plugin that allows to share Notebooks.',
    packages=find_packages(),
    cmdclass=cmdclass,
    author          = 'Viacheslav Kovalevskyi, Gleb Bochkarev, Ivanna Sak, Abdalla Abdulmonem',
    author_email    = 'viacheslav@kovalevskyi.com',
    license         = 'MIT',
    platforms       = "Linux, Mac OS X, Windows",
    keywords        = ['Jupyter', 'JupyterLab', 'GitHub', 'GCP'],
    python_requires = '>=3.5',
    classifiers     = [
        'Intended Audience :: Developers',
        'Intended Audience :: System Administrators',
        'Intended Audience :: Science/Research',
        'License :: OSI Approved :: MIT License',
        'Programming Language :: Python',
        'Programming Language :: Python :: 3',
    ],
    install_requires=requires
)

setuptools.setup(
    version="0.1.1",
    **setup_dict
)
