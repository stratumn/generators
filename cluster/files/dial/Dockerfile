FROM alpine

RUN apk update && apk add curl
COPY dial.sh /dial.sh
COPY keys.sh /keys.sh

CMD ["/dial.sh"]