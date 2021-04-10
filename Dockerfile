FROM openjdk:8

RUN mkdir /src
COPY ./o2server /src
WORKDIR /src

EXPOSE 80

CMD './start_linux.sh'
