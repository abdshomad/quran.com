# بسم الله الرحمن الرحيم
# vim: ts=2 sw=2 noexpandtab

package Quran::View::JSON;

use strict;
use base 'Catalyst::View::JSON';

__PACKAGE__->config({
	allow_callback => 0,
	expose_stash => qr/^json_/
});

1;
