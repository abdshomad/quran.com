package Quran::Plugin::Account;

use Moose::Role;
use namespace::autoclean;

sub account { return shift->user(@_) }

1;
