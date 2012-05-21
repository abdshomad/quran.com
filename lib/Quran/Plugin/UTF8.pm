package Quran::Plugin::UTF8;

# TODO
# Purpose: this is a hackish workaround for a utf8 weirdism -- less time explaining, more time coding

use Moose::Role;
use namespace::autoclean;

use utf8;

after prepare_path => sub {
	my $c = shift;

	$c->stash->{utf8} = {
		bismillah => 'بسم الله الرحمن الرحيم',
		arabic => 'عربي',
		tafsir => 'تفسير',
		qrnkrm => 'القرآن الكريم'
	};
};

1;
