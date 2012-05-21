package Quran::Controller::Main;
use Moose;
use namespace::autoclean;

BEGIN { extends 'Catalyst::Controller' }

sub base :Chained('/') :PathPart('') :CaptureArgs(0) {
	my ($self, $c) = (shift, @_);
	my $stash = $c->stash;

	$stash->{static} = { js => 1, css => 1 };
	$stash->{include} = { head => 1, body => 1, foot => 1 };
	$stash->{options} = $c->model('Options')->options($c);
}

sub _surah :Chained('base') :PathPart('') :CaptureArgs(1) {
	my ($self, $c, $id) = (shift, @_);

	if ($id =~ /^\d{1,3}$/ and $id >= 1 and $id <= 114) {
		$c->stash(
			surah_id => $id,
			template => 'screen/main/view.mhtml',
			   class => 'main'
		);
	}
	else {
		return $c->detach('/default');
	}
}

sub surah :Chained('_surah') :PathPart('') :Args(0) {
	my ($self, $c) = (shift, @_);
	my $surah = $c->stash->{surahs}->[ $c->stash->{surah_id} - 1 ];
	my $page = $c->controller('Page')->range($c, { surah => $c->stash->{surah_id}, start => 1, pages => 2 });

	if ($surah->{page_end} <= $surah->{page_start} + 2) {
		$page->{last} = $surah->{ayahs};
	}

	unless ($page->{last} == $surah->{ayahs}) {
		$page->{next} = $c->controller('Page')->range($c, { surah => $page->{surah}, start => $page->{last} + 1, pages => 2 });
	}

	$c->stash(
		     page => $page,
		bismillah => $surah->{bismillah}
	);

	$c->response->redirect('/'. $c->stash->{language}->{language_code} .'/'. $c->stash->{surah_id} .'/'. $page->{first} .'-'. $page->{last} .'/');
}

sub _ayahs :Chained('_surah') :PathPart('') :CaptureArgs(1) {
	my ($self, $c, $ayahs) = (shift, @_);
	my $stash = $c->stash;

	return $c->detach('/default') unless $ayahs =~ /^\d{1,3}(-\d{1,3})?$/;

	my $page = {
		surah => $stash->{surah_id}
	};;
	($page->{first}, $page->{last}) = split m{-}, $ayahs, 2;

	return $c->detach('/default') unless $page->{first} >= 1;

	my $surah = $stash->{surahs}->[ $stash->{surah_id} - 1 ];

	if ($page->{last}) {
		return $c->detach('/default')
			unless $page->{last} > $page->{first}
				and $page->{last} <= $surah->{ayahs};
	}
	else { $page->{last} = $page->{first}; }

	unless ($page->{first} == 1) {
		$page->{prev} = $c->controller('Page')->range($c, { surah => $page->{surah}, end => $page->{first} - 1, pages => 2 });
	}

	unless ($page->{last} == $surah->{ayahs}) {
		$page->{next} = $c->controller('Page')->range($c, { surah => $page->{surah}, start => $page->{last} + 1, pages => 2 });
	}

	$stash->{page} = $page;
	$stash->{json}->{page} = $stash->{page};

	$stash->{bismillah} = ($surah->{bismillah} and $page->{first} == 1);
}

sub view :Chained('_ayahs') :PathPart('') :Args(0) {
	my ($self, $c, $partial) = (shift, shift, shift);
	my ($stash, $session, $cache) = ($c->stash, $c->session, $c->cache('memcache'));
	my ($language_code, $keys, $content) = ($stash->{language}->{language_code}, [ map { "$stash->{page}->{surah}:$_" } $stash->{page}->{first} .. $stash->{page}->{last} ]);

	# quick hack
	$stash->{page}->{first} = $stash->{page}->{surah} .':'. $stash->{page}->{first};
	$stash->{page}->{last} = $stash->{page}->{surah} .':'. $stash->{page}->{last};

	$self->stash_session_content($c, $keys);

	$stash->{json}->{class} = 'main';
	$stash->{json}->{modules} = '*.*';

	if ($partial) {
		return $c->view('Mason')->render($c, 'screen/main/_partial/ayahs.mhtml');
	}

	#$c->response->body('debug'); # use this to differentiate internal performance from view performance, base cost is ~10ms, target is ~15-30 ms
}

sub stash_session_content {
	my ($self, $c, $keys) = (shift, shift, shift);
	my ($stash, $session, $cache) = ($c->stash, $c->session, $c->cache('memcache'));
	my ($language_code, $content) = ($stash->{language}->{language_code});

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
	$stash->{json}->{content} = $stash->{content} if $c->debug;

	$stash->{keys} = $keys;
	$stash->{json}->{keys} = $stash->{keys};

	$stash->{fonts} = $c->controller('Fonts')->from_keys($c, $keys);
	$stash->{json}->{pages} = $stash->{fonts}->{pages};

	unless ($stash->{audio}->{reciter} = $cache->get('audio.reciter')) {
		my @result = $c->model('DB::Audio::Reciter')->search(undef, { order_by => [{ -asc => 'priority' }, { -asc => 'path' }] });

		$stash->{audio}->{reciter}->{order} = [ map { $_->get_column('path') } @result ];
		$stash->{audio}->{reciter}->{data} = { map { $_->get_column('path') => {
			arabic => $_->get_column('arabic'),
			english => $_->get_column('english'),
		} } @result };

		$cache->set('audio.reciter', $stash->{audio}->{reciter});
	}
	$stash->{json}->{audio} = $stash->{audio};

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
	$stash->{json}->{account} = $stash->{account};
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

	$stash->{fonts} = $c->controller('Fonts')->fonts($c, @pages);

	$stash->{keys} = $keys;
	$stash->{json}->{keys} = $stash->{keys};
=cut

__PACKAGE__->meta->make_immutable;

1;
