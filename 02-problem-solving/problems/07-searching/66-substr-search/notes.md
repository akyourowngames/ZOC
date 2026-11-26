# Notes

`find` returns `string::size_type`, not `int`. Store it in `auto` or
`string::size_type` to avoid signed/unsigned and range issues. The current
program's found branch is unfinished.
