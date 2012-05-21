package Quran::Controller::Page;
use Moose;
use namespace::autoclean;

BEGIN { extends 'Catalyst::Controller' }

=head1 NAME

Quran::Controller::Page - Catalyst Controller

=head1 DESCRIPTION

Catalyst Controller.

=head1 METHODS

=cut


=head2 range

=cut

sub range :Private {
	my ($self, $c, $params) = (shift, shift, shift);

	my $range;
	my $key = "range?surah=$params->{surah}&pages=$params->{pages}";
	my ($where, $order_by);
	if ($params->{start}) {
		$key .= "&start=$params->{start}";
		$where = { '>=', $params->{start} };
		$order_by = { -asc => 'me.page_num' };
	}
	elsif ($params->{end}) {
		$key .= "&end=$params->{end}";
		$where = { '<=', $params->{end} };
		$order_by = { -desc => 'me.page_num' };
	}
	unless ($range = $c->memcache($key)) {
		my @set = $c->model('DB::Quran::Ayah')->search({
			'me.surah_id' => $params->{surah},
			'me.ayah_num' => $where
		}, {
				  select => [{ min => 'me.ayah_num' }, { max => 'me.ayah_num' }],
				      as => ['first', 'last'],
				group_by => ['me.page_num'],
				order_by => $order_by,
				    rows => 2
		});
		if ($params->{start}) {
			$range = {
				surah => $params->{surah},
				first => $set[0]->get_column('first'),
				 last => $set[1] ? $set[1]->get_column('last') : $set[0]->get_column('last')
			};
		}
		elsif ($params->{end}) {
			$range = {
				surah => $params->{surah},
				first => $set[1] ? $set[1]->get_column('first') : $set[0]->get_column('first'),
				 last => $set[0]->get_column('last')
			};
		}

		$c->memcache($key, $range);
	}

	return $range;
}

sub from_key :Private {
	my ($self, $c, $key) = (shift, shift, shift);

	unless (defined $self->{ayah_key_to_page_num}) {
		my @set = $c->model('DB::Quran::Ayah')->search(undef, {
			 columns => [qw/ayah_key page_num/],
			order_by => [{ -asc => 'surah_id' }, { -asc => 'ayah_num' }]
		});
		$self->{ayah_key_to_page_num} = { map {
			$_->get_column('ayah_key') => $_->get_column('page_num')
		} @set };
	}

	return $self->{ayah_key_to_page_num}->{ $key };
}

sub from_keys :Private {
	my ($self, $c, $keys) = (shift, shift, shift);
	my ($pages, %pages, @pages);

	push @{ $pages }, $self->from_key($c, $_) for @{ $keys };
	%pages = map{ $_ => 1 } @{ $pages };
	@pages = sort { $a <=> $b } keys %pages;
	$pages = \@pages;

	return $pages;
}

=head1 AUTHOR

Nour Sharabash <nour@quran.com>

=head1 LICENSE

Copyright (c) 2011 by Nour Sharabash

=cut

__PACKAGE__->meta->make_immutable;

1;
