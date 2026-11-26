# Ideas and Hints

Scan each character. Check uppercase and lowercase ranges separately, then
convert only when a letter matches.

Use `static_cast<unsigned char>(ch)` when passing a character to
`tolower` or `toupper`.
