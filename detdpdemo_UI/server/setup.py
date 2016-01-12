from setuptools import setup, find_packages, Command

setup(
    name='detdp',
    description='',
    version='0.0.1',
    packages=find_packages(),
    #package_data={'': ['airflow/alembic.ini']},
    include_package_data=True,
    zip_safe=False,
    install_requires=[
        'flask',
        'pymongo',
        'pandas',
        'fuzzywuzzy',
        'unicodecsv',
        'gunicorn',
        'flask-cors'
    ],
    extras_require={
    },
    author='Yue Ming',
    author_email='yue.ming@wdc.com',
    url='http://yue.ming',
)
