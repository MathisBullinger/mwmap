for file in data/**/*
do
  cwebp -q 50 "$file" -o ${file//.png/.webp}
done
