import sys
import json
import os
from pydub import AudioSegment


mix = json.loads(sys.argv[1])
segments = mix['segments']
full_track = AudioSegment.silent(100)

def cache_files(segment_list):
    files = {}
    for segment in segment_list:
        if segment['file'] not in files:
            print 'here is a file!: ' + segment['file']
            files[segment['file']] = AudioSegment.from_file('./server/audio/' + segment['file']+'.mp3', format='mp3')
    return files

files = cache_files(segments)

for segment in segments:

    start = segment['cut']['start']
    end = segment['cut']['end']

    cut_audio = files[segment['file']][start:end]

    full_track = full_track.append(cut_audio)

full_track.export(mix['title'] + '.mp3', format='mp3')
