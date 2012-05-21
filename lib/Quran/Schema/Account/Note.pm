# vim: ts=2 sw=2 noexpandtab
package Quran::Schema::Account::Note;

use strict;
use warnings;

use base 'DBIx::Class::Core';

__PACKAGE__->table('account.note');
__PACKAGE__->add_columns(
	'note_id'    => { data_type => 'integer' =>  is_auto_increment => 1, is_nullable => 0, sequence => 'note_note_id_seq' =>  },
	'member_id' => { data_type => 'integer', is_foreign_key => 1, is_nullable => 0 },
	'public'     => { data_type => 'boolean', default_value => \'false', is_nullable => 0 },
	'feedback'   => { data_type => 'boolean', default_value => \'false', is_nullable => 0 },
	'subject'    => { data_type => 'text', is_nullable => 1 },
	'body'       => { data_type => 'text', is_nullable => 0 },
	'reply_id'   => { data_type => 'integer', is_foreign_key => 1, is_nullable => 1 },
  'ayah_key'   => { data_type => 'text', is_foreign_key => 1, is_nullable => 0 },
	'created'    => { data_type => 'timestamp with time zone', is_nullable => 1 },
	'updated'    => { data_type => 'timestamp with time zone', is_nullable => 1 },
);
__PACKAGE__->set_primary_key('note_id');

__PACKAGE__->belongs_to('member' => 'Quran::Schema::Account::Member',
	{ 'foreign.member_id' => 'self.member_id' },
	{ is_deferrable => 1, on_delete => 'CASCADE', on_update => 'CASCADE' });

__PACKAGE__->belongs_to('ayah' => 'Quran::Schema::Quran::Ayah',
 { 'foreign.ayah_key' => 'self.ayah_key' },
 { is_deferrable => 1, on_delete => 'CASCADE', on_update => 'CASCADE' });

__PACKAGE__->belongs_to('parent' => 'Quran::Schema::Account::Note',
	{ 'foreign.note_id' => 'self.reply_id' },
	{
		is_deferrable => 1,
		join_type     => 'LEFT',
		on_delete     => 'CASCADE',
		on_update     => 'CASCADE',
	});

__PACKAGE__->has_many('reply' => 'Quran::Schema::Account::Note',
	{ 'foreign.reply_id' => 'self.note_id' },
	{ cascade_copy => 0, cascade_delete => 0 });

sub time {
	my ($self, $column) = @_;
	use DateTime::Format::Pg;
	my $now = DateTime->now();
	my $time = DateTime::Format::Pg->parse_datetime($self->get_column($column));
	if ($now->dmy eq $time->dmy) {
		$time = $time->strftime('%l:%M %P') ."\n";
	}
	else {
		$time = $time->month_abbr .' '. $time->day ."\n";
	}
	return $time;
}

sub preview {
	my ($self, $column) = @_;
	my $text = $self->get_column($column);
	if (length $text > 100) {
		my @input = split /\W+/, $text;
		my @output;
		my $length = 0;
		for (@input) {
			my $word = length $_;
			if ($length + $word <= 100) {
				push @output, $_;
				$length += $word;
			}
			else { last; }
		}
		my $output;
		unless ($length == 0) {
			$output = join ' ', @output;
		}
		else {
			$output = substr($text, 0, 100);
		}
		return $output .' ...';
	}
	else {
		return $text;
	}
}

1;
