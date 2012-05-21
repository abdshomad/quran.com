package Quran::Controller::Page;
use Moose;
use namespace::autoclean;

BEGIN { extends 'Catalyst::Controller' }

sub lookup :Private {
	my ($self, $c, $surah_id) = @_;

	my ($key, $result) = ("lookup?surah_id=$surah_id");

	unless ($result = $c->memcache($key)) {
		my @page = $c->model('DB::Quran::Page')->search({
			surah_id => $surah_id
		}, {
			order_by => { -asc => 'page_num' },
			columns => [qw/page_num ayah_num/]
		});

		my @surah = $c->model('DB::Quran::Surah')->search({
			surah_id => $surah_id
		}, {
			columns => ['page_num']
		});

		my @ayah = $c->model('DB::Quran::Ayah')->search({
			surah_id => $surah_id
		}, {
			order_by => { -asc => 'ayah_num' },
			columns => ['page_num']
		});

		$result = {
			ayah => [ map { $_->get_column('page_num') } @ayah ],
			page => { map { $_->get_column('page_num') => $_->get_column('ayah_num') } @page },
			surah => map { $_->get_column('page_num') } @surah,
		};

		$c->memcache($key, $result);
	}

	return $result;
}

sub range :Private {
	my ($self, $c, $params) = @_;

	my ($key, $result) = ("range?surah=$params->{surah}&pages=$params->{pages}");

	if ($params->{start}) {
		$key .= "&start=$params->{start}";
	}
	elsif ($params->{end}) {
		$key .= "&end=$params->{end}";
	}

	unless ($result = $c->memcache($key)) {
		my ($where, $order_by);

		if ($params->{start}) {
			$where = { '>=', $params->{start} };
			$order_by = { -asc => 'me.page_num' };
		}
		elsif ($params->{end}) {
			$where = { '<=', $params->{end} };
			$order_by = { -desc => 'me.page_num' };
		}

		my @set = $c->model('DB::Quran::Ayah')->search({
			'me.surah_id' => $params->{surah},
			'me.ayah_num' => $where
		}, {
				  select => [{ min => 'me.ayah_num' }, { max => 'me.ayah_num' }],
				      as => ['first', 'last'],
				group_by => ['me.page_num'],
				order_by => $order_by,
				    rows => $params->{pages}
		});
		if ($params->{start}) {
			$result = [
				$set[0]->get_column('first'),
				$set[1] ? $set[1]->get_column('last') : $set[0]->get_column('last')
			];
		}
		elsif ($params->{end}) {
			$result = [
					$set[1] ? $set[1]->get_column('first') : $set[0]->get_column('first'),
					$set[0]->get_column('last')
			 ];
		}

		$c->memcache($key, $result);
	}

	return $result;
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

__PACKAGE__->meta->make_immutable;

1;
