#
#  Dockerfile para proyectos Django
#

# Base image.
FROM python:2.7


ENV ES_URL "http://es:9200"
# Create code folder.
RUN mkdir /code

# Set working dir.
WORKDIR /code

# Add python requirements file.
COPY requirements.txt /code/

# Install required programs.
RUN pip install -r requirements.txt
RUN apt-get update
RUN apt-get install -y \
    gettext \
    nginx \
    vim

RUN echo "daemon off;" >> /etc/nginx/nginx.conf
RUN rm /etc/nginx/sites-enabled/default
RUN ln -s /code/conf/nginx-app.conf /etc/nginx/sites-enabled/

# Add source code.
COPY . /code/

# Run script file.
CMD ./run.sh
