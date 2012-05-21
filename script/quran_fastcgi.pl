#!/usr/bin/env perl

# Uncomment below and set to your clone of the app's directory to debug dbic queries
BEGIN {
	use File::Spec;
	use FindBin;
	my $dbic_log_file = File::Spec->catdir($FindBin::Bin, '../log/database.log');
	$ENV{DBIC_TRACE} = "1=$dbic_log_file";
};
use File::Basename 'dirname';
use File::Spec::Functions qw(catdir splitdir);

# Source directory has precedence
my @base = (splitdir(dirname(__FILE__)), '..');
my $lib = join('/', @base, 'lib');
unshift @INC, $lib;
push @INC, $lib;

use Catalyst::ScriptRunner;
Catalyst::ScriptRunner->run('Quran', 'FastCGI');

1;

=head1 NAME

quran_fastcgi.pl - Catalyst FastCGI

=head1 SYNOPSIS

quran_fastcgi.pl [options]

 Options:
   -? -help      display this help and exits
   -l --listen   Socket path to listen on
                 (defaults to standard input)
                 can be HOST:PORT, :PORT or a
                 filesystem path
   -n --nproc    specify number of processes to keep
                 to serve requests (defaults to 1,
                 requires -listen)
   -p --pidfile  specify filename for pid file
                 (requires -listen)
   -d --daemon   daemonize (requires -listen)
   -M --manager  specify alternate process manager
                 (FCGI::ProcManager sub-class)
                 or empty string to disable
   -e --keeperr  send error messages to STDOUT, not
                 to the webserver

=head1 DESCRIPTION

Run a Catalyst application as fastcgi.

=head1 AUTHORS

Catalyst Contributors, see Catalyst.pm

=head1 COPYRIGHT

This library is free software. You can redistribute it and/or modify
it under the same terms as Perl itself.

=cut
