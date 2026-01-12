## Release proces

1. Make necessary code changes and commit
2. Bump version in package.json
3. Run `npm run release` to build zip-files for upload to addon-stores
4. Update firefox-updates.json 
5. Git commit, tag + push

# Firefox addons
1. Submit a new version on https://addons.mozilla.org/nl/developers/addon/84a798bd9dc7461b9e07/versions/submit/
2. For source-code upload, create a release zip on https://github.com/filidorwiese/hootly.ai/releases
3. Upload zip + firefox-updates.json to hootly.ai using SFTP:
   scp firefox-updates.json hootlyai@sftp.oni.nl:~/HTML/ 
   scp dist/*.zip hootlyai@sftp.oni.nl:~/HTML/releases/
4. Download addon at https://addons.mozilla.org/nl/firefox/addon/84a798bd9dc7461b9e07/

# Chrome store
...
