#!/usr/bin/env perl
# vim: ts=4 sw=4 noexpandtab
our %dir;

BEGIN {
	use File::Basename 'dirname';
	use File::Spec::Functions qw/catdir splitdir/;

	$dir{base} = join '/', (splitdir(dirname(__FILE__)), '..');
	$dir{script} = "$dir{base}/script";
	$dir{lib} = "$dir{base}/lib";
	$dir{log} = "$dir{base}/log";

	unshift @INC, $dir{lib};

	$ENV{DBIC_TRACE} = "1=$dir{log}/database.log" if -e $dir{log};
	$ENV{QURAN_BASE_DIR} = $dir{base};
	$ENV{CATALYST_SCRIPT_GEN} = 40;
};

use Catalyst::ScriptRunner;
Catalyst::ScriptRunner->run('Quran', 'Server');

1;

=head1 NAME

quran_server.pl - Catalyst Test Server

=head1 SYNOPSIS

quran_server.pl [options]

   -d --debug           force debug mode
   -f --fork            handle each request in a new process
                        (defaults to false)
   -? --help            display this help and exits
   -h --host            host (defaults to all)
   -p --port            port (defaults to 3000)
   -k --keepalive       enable keep-alive connections
   -r --restart         restart when files get modified
                        (defaults to false)
   -rd --restart_delay  delay between file checks
                        (ignored if you have Linux::Inotify2 installed)
   -rr --restart_regex  regex match files that trigger
                        a restart when modified
                        (defaults to '\.yml$|\.yaml$|\.conf|\.pm$')
   --restart_directory  the directory to search for
                        modified files, can be set mulitple times
                        (defaults to '[SCRIPT_DIR]/..')
   --follow_symlinks    follow symlinks in search directories
                        (defaults to false. this is a no-op on Win32)
   --background         run the process in the background
   --pidfile            specify filename for pid file

 See also:
   perldoc Catalyst::Manual
   perldoc Catalyst::Manual::Intro

=head1 DESCRIPTION

Run a Catalyst Testserver for this application.

=head1 AUTHORS

Catalyst Contributors, see Catalyst.pm

=head1 COPYRIGHT

This library is free software. You can redistribute it and/or modify
it under the same terms as Perl itself.

=cut

