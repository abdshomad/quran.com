package Quran::Controller::Main;
use Moose;
use namespace::autoclean;

BEGIN { extends 'Catalyst::Controller' }

sub base :Chained('/base') :PathPart('') :CaptureArgs(0) {
	my ($self, $c) = (shift, @_);
	my ($stash) = ($c->stash);

	$stash->{static} = { js => 1, css => 1 };
	$stash->{include} = { head => 1, body => 1, foot => 1 };
	$stash->{options} = $c->model('Options')->options($c);
}

sub _surah :Chained('base') :PathPart('') :CaptureArgs(1) :Match('^\d{1,3}$') {
	my ($self, $c, $id) = (shift, @_);
	my ($stash) = ($c->stash);

	if ($id =~ /^\d{1,3}$/ and $id >= 1 and $id <= 114) {
		my $surah = $stash->{surahs}->[ $id - 1 ];

		$c->stash(
			surah => $surah,
			template => 'web/template/main.mhtml'
		);
	}
	else {
		return $c->detach('/default');
	}
}

# load two pages first instead of 1

sub surah :Chained('_surah') :PathPart('') :Args(0) {
	my ($self, $c) = (shift, @_);
	my ($stash) = ($c->stash);

	my $range = $c->controller('Page')->range($c, { surah => $stash->{surah}->{surah_id}, start => 1, pages => 2 });

	$stash->{range} = $range;

	$c->detach('/main/ayah');
}

sub _ayah :Chained('_surah') :PathPart('') :CaptureArgs(1) {
	my ($self, $c, $ayahs) = (shift, @_);
	my $stash = $c->stash;

	return $c->detach('/default') unless $ayahs =~ /^\d{1,3}(-\d{1,3})?+$/;

	my $range = [split m{-}, $ayahs, 2];

	return $c->detach('/default') unless $range->[0] >= 1;

	if ($range->[1]) {
		return $c->detach('/default')
			unless $range->[1] > $range->[0]
				and $range->[1] <= $stash->{surah}->{ayahs};
	}
	else { $range->[1] = $range->[0]; }

	$stash->{range} = $range;
}

sub ayah :Chained('_ayah') :PathPart('') :Args(0) {
	my ($self, $c, $partial) = (shift, shift, shift);
	my $stash = $c->stash;
	my $keys = [ map { "$stash->{surah}->{surah_id}:$_" } $stash->{range}->[0] .. $stash->{range}->[1] ];

	$self->stash_session_content($c, $keys);

	if ($partial) {
		$partial = $c->view('Mason')->render($c, 'web/template/main/ayat/ayah.mhtml');
		return $partial;
	}
}

sub stash_session_content {
	my ($self, $c, $keys) = (shift, shift, shift);
	my ($stash, $session, $cache) = ($c->stash, $c->session, $c->cache('memcache'));
	my ($language_code, $content) = ($stash->{language}->{language_code});

	$stash->{keys} = $keys;
	$stash->{pages} = $c->controller('Page')->from_keys($c, $keys);
	$stash->{fonts} = $c->controller('Fonts')->css($c, $stash->{pages});
	$stash->{lookup} = $c->controller('Page')->lookup($c, $stash->{surah}->{surah_id});


	$stash->{content}->{ $_ }->{page} = $c->controller('Page')->from_key($c, $_) for @{ $keys };

	for my $type (keys %{ $session->{content}->{resources}->{ $language_code } }) {
		for my $resource_code (keys %{ $session->{content}->{resources}->{ $language_code }->{ $type } }) {
			if ($session->{content}->{resources}->{ $language_code }->{ $type }->{ $resource_code }) {
				push @{ $content->{resources} }, { language_code => $language_code, type => $type, resource_code => $resource_code };
			}
		}
	}

	$content->{resources} = $c->model('Content')->resources($c, $content->{resources}, $keys);

	$stash->{content}->{ $_ }->{resources} = $content->{resources}->{ $_ } for @{ $keys };

	if ($session->{content}->{quran}->{text}) {
		$content->{quran} = $c->model('Content')->text($c, $session->{content}->{quran}->{text}, $keys);
	}
	elsif ($session->{content}->{quran}->{words}) {
		$content->{quran} = $c->model('Content')->words($c, $language_code, $keys);
	}
	elsif ($session->{content}->{quran}->{images}) {
		$content->{quran} = $c->model('Content')->images($c, $keys);
	}

	$stash->{content}->{ $_ }->{quran} = $content->{quran}->{ $_ } for @{ $keys };

	unless ($stash->{audio}->{reciter} = $cache->get('audio.reciter')) {
		my @result = $c->model('DB::Audio::Reciter')->search(undef, { order_by => [{ -asc => 'priority' }, { -asc => 'path' }] });

		$stash->{audio}->{reciter}->{order} = [ map { $_->get_column('path') } @result ];
		$stash->{audio}->{reciter}->{data} = { map { $_->get_column('path') => {
			arabic => $_->get_column('arabic'),
			english => $_->get_column('english'),
		} } @result };

		$cache->set('audio.reciter', $stash->{audio}->{reciter});
	}

	# account/member specific content
	if ($c->user_exists) {
		$stash->{account}->{info} = {
			login => $c->user->login,
			 name => $c->user->name
		};

		my $set = $c->user->bookmark->search_rs(undef, {
			    join => 'ayah',
			 columns => [{ surah => 'ayah.surah_id' }, { ayah => 'ayah.ayah_num' }, { key => 'me.ayah_key' }, { range => 'me.context_range' }, { state => 'me.context_state' }],
			order_by => [{ -asc => 'ayah.surah_id' }, { -asc => 'ayah.ayah_num' }]
		});

		while (my $result = $set->next) {
			$stash->{account}->{bookmarks}->{ $result->get_column('surah') }->{ $result->get_column('ayah') } = {
				    key => $result->get_column('key'),
				context => {
					range => $result->get_column('range'),
					state => $result->get_column('state')
				}
			};
		}

		$set = $c->user->tag->search_rs({
				'ayah.surah_id' => $stash->{surah}->{surah_id}
		}, {
			    join => ['ayah', 'collective'],
			 columns => [{ tag => 'collective.value' }, { key => 'me.ayah_key' }],
			order_by => [{ -asc => 'ayah.ayah_num' }, { -asc => 'collective.value' }]
		});

		while (my $result = $set->next) {
			push @{ $stash->{account}->{tags}->{ $result->get_column('key') } }, $result->get_column('tag');
		}

		$stash->{account}->{lastmark} = {
			    key => $c->user->lastmark->ayah_key,
			context => {
				range => $c->user->lastmark->context_range,
				state => $c->user->lastmark->context_state
			}
		} if $c->user->lastmark;

		my @roles = $c->user->roles;
		$stash->{account}->{roles} = \@roles;
	}
}

=cut
	# old mutual code for notes, works
		my $mutual = $c->user->mutual;
		my $member_id = [$c->user->member_id];
		push @{ $member_id }, $_->member_id for $c->user->followed;
		$set = $c->model('DB::Account::Note')->search({
			'ayah.surah_id'    => $surah,
			'member.member_id' => $member_id,
			'me.reply_id'      => undef
		}, {
			join => ['ayah', 'member'],
			columns => [{ key => 'ayah.ayah_key' }, { public => 'me.public' }, { feedback => 'me.feedback' }, { subject => 'me.subject' }, { body => 'me.body' }, { created => 'me.created' }, { updated => 'me.updated' }, { login => 'member.login' }, { name => 'member.name' }, { email => 'member.email' }],
		 order_by => { -desc => 'created' }
		});
		while (my $result = $set->next) {
			my $column = $result->{_column_data};
			my $self_author = $c->user->login eq $column->{login}? 1 : 0;
			my $array;
			if ($self_author) {
				$stash->{user}->{note}->{ $column->{key} }->{self} = []
					unless defined $stash->{user}->{note}->{ $column->{key} }->{self};
				$array = $stash->{user}->{note}->{ $column->{key} }->{self};
			}
			else {
				$stash->{user}->{note}->{ $column->{key} }->{followed} = []
					unless defined $stash->{user}->{note}->{ $column->{key} }->{followed};
				$array = $stash->{user}->{note}->{ $column->{key} }->{followed};
			}
			push @{ $array }, {
				public   => $column->{public},
				feedback => $column->{feedback},
				subject  => ($column->{subject} or '(no subject)'),
				preview  => $result->preview('body'),
				body     => $column->{body},
				time     => $result->time('created'),
				login    => $column->{login},
				name     => $column->{name},
				email    => $column->{email},
				mutual   => ($mutual->{ $column->{login} } or 0)
			};
		}

	# stuff for fonts css
	my ($page_num_start, $page_num_end) = (
		$c->controller('Page')->key($c, $stash->{page}->{surah} .':'. $stash->{page}->{first}),
		$c->controller('Page')->key($c, $stash->{page}->{surah} .':'. $stash->{page}->{last})
	);
	my @pages = $page_num_start .. $page_num_end;

	$stash->{fonts} = $c->controller('Fonts')->css($c, @pages);

	$stash->{keys} = $keys;
	$stash->{json}->{keys} = $stash->{keys};
=cut

__PACKAGE__->meta->make_immutable;

1;
