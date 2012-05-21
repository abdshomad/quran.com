#!/usr/bin/env perl
use strict;
use warnings;

my $file = $ARGV[0];
my $out = $file;
$out =~ s/\.svg$/.new.svg/;
my @head;
my @copy;
my @foot;

my ($head, $copy, $foot) = (1, 0, 0);
my $fh;
my $fh_out;
open $fh, $file;
open $fh_out, ">$out";
while (<$fh>) {
	push @head, $_ if $head;
	if ($_ =~ /<path id="path"/) {
		$copy = 1;
		$head = 0;
		next;
	}
	if ($copy and $_ =~ /"\/>/) {
		$copy = 0;
		$foot = 1;
	}
	push @copy, $_ if $copy;
	push @foot, $_ if $foot;
}
close $fh;

$copy = join '', @copy;

my $adjust;
$adjust->{x} = $ARGV[1];
$adjust->{y} = $ARGV[2];
$adjust->{scale}->{x} = $ARGV[3];
$adjust->{scale}->{y} = $ARGV[4];

@copy = split /\n/, $copy;
my @new;
for (@copy) {
	my $length = length($_) - 2;
	my $line = substr($_, -1 * $length);
	my $prefix = substr($_, 0, 2);
	my @numbers = split /[\s,]+/, $line;
	for (my $i = 0; $i < scalar @numbers; $i++) {
		if ($i % 2 == 0) {
			$numbers[$i] += $adjust->{x} if $prefix =~ /^[MCLHS]/;
			$numbers[$i] += $adjust->{y} if $prefix =~ /^[V]/;
			$numbers[$i] = sprintf('%1f', ($numbers[$i] * $adjust->{scale}->{x}));
		}
		else {
			$numbers[$i] += $adjust->{y} if $prefix =~ /^[MCLS]/;
			$numbers[$i] = sprintf('%1f', ($numbers[$i] * $adjust->{scale}->{y}));
		}
	}
	push @new, $prefix . join(' ', @numbers);
}

print $fh_out join "", @head;
print $fh_out join "\n", @new;
print $fh_out join "", @foot;

close $fh_out;


