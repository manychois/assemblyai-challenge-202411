FROM node:22-alpine

RUN npm install -g pnpm
RUN apk add python3
RUN wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O /bin/yt-dlp
RUN wget https://github.com/ffbinaries/ffbinaries-prebuilt/releases/download/v6.1/ffprobe-6.1-linux-64.zip && \
    unzip ffprobe-6.1-linux-64.zip && \
    mv ffprobe /bin/ffprobe && \
    rm ffprobe-6.1-linux-64.zip
RUN wget https://github.com/ffbinaries/ffbinaries-prebuilt/releases/download/v6.1/ffmpeg-6.1-linux-64.zip && \
    unzip ffmpeg-6.1-linux-64.zip && \
    mv ffmpeg /bin/ffmpeg && \
    rm ffmpeg-6.1-linux-64.zip
RUN chmod a+rx /bin/yt-dlp

WORKDIR /app
