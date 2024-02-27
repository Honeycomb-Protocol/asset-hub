for name in "$@"
do
  yarn lfg:$name && cargo publish --package hpl-$name --allow-dirty
done