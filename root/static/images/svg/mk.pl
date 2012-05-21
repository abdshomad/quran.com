#!/usr/bin/env perl
use strict;
use warnings;

open my $in, 'out';
my @line;

while (<$in>) {
	push @line, $_;
}

for (@line) {
	my $name = $_;
	my $path = $_;
	$name =~ s/^[\s]+([^:]+)\s*:\s*"[^"]+"[,\r\n]*$/$1/;
	$path =~ s/^[\s]+[^:]+\s*:\s*"([^"]+)"[,\r\n]*$/$1/;
	open my $out, ">$name.svg";
print $out <<END
<svg height="28" version="1.1" width="28" xmlns="http://www.w3.org/2000/svg" viewBox="-4 -4 40 40">
	<path fill="none" stroke="#ffffff" stroke-width="6" stroke-linejoin="round" opacity="0" class="stroke" d="$path"/>
	<path fill="#000000" stroke="none" opacity="1" class="fill" d="$path"/>
</svg>
END
;
	close $out;
}

close $in;
