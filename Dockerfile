FROM python:3.14-rc-alpine3.20

RUN apt-get update
RUN apt-get install graphviz -y

WORKDIR /app

COPY . /app

RUN pip install --upgrade pip
RUN pip install -r requirements.py

EXPOSE 5000

ENV FLASK_APP=app.py
ENV FLASK_ENV=development

CMD ["flask", "run", "--host=0.0.0.0"]