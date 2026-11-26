# Notes

The current `freq` array contains uninitialized values. Incrementing one reads
an indeterminate value, so the results are undefined. Use
`int freq[101] = {};` when values are between `0` and `100`.
