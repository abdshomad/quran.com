#!/usr/bin/env perl
use strict;
use warnings;
use FindBin;
use YAML qw/LoadFile DumpFile/;
use DBI;

my $db_config = LoadFile $FindBin::Bin .'/quran_database.yml';
my $dbh = DBI->connect($db_config->{database}->{dsn}, $db_config->{database}->{user}, $db_config->{database}->{password}, $db_config->{database});

my $select_api = $dbh->prepare('SELECT * FROM share.api');
my $select_auth = $dbh->prepare_cached('SELECT * FROM share.auth WHERE network_key = ?');

my $config;

$select_api->execute;

while (my $api_config = $select_api->fetchrow_hashref) {
	my $pkg_config;

	$select_auth->execute( $api_config->{network_key} );

	while (my $auth_config = $select_auth->fetchrow_hashref) {
		delete $auth_config->{network_key};

		$auth_config->{scope} = $api_config->{scope};
		$auth_config->{uri_return} = 'http://quran.com/me/share/auth/'. $api_config->{api_key} .'/return';

		$pkg_config->{_auth} = $auth_config;
	}

	my $pkg_name = 'Controller::Share::'. ( join "::", map { ( uc substr $_, 0, 1 ) . ( lc substr $_, 1 ) } split /_/, $api_config->{api_key} );

	$api_config->{id} = $api_config->{api_key};

	delete $api_config->{scope};
	delete $api_config->{api_key};
	delete $api_config->{network_key};

	$pkg_config->{_api} = $api_config;

	$config->{ $pkg_name } = $pkg_config;
}

my $file = $FindBin::Bin . '/quran_share.yml';

DumpFile($file, $config);

system(qw/chown nour:nour/, $file);

1;
