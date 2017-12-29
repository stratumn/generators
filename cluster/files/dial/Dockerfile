FROM alpine

RUN apk update && apk add curl
COPY dial.sh /dial.sh

CMD ["/dial.sh"]