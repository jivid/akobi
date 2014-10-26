echo "Removing old files"
rm -rf testing/
echo "Preparing directories for build"
mkdir -p testing/stage testing/build
echo "Staging files"
find refactor -type f | xargs -I {} cp {} testing/stage/
echo "Transforming jsx"
jsx -x jsx testing/stage testing/stage
echo "Moving files from staging area"
mv testing/stage/*.js testing/build/
rm -rf testing/stage
echo "Done"
