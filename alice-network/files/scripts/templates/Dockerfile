FROM stratumn/alice:latest

COPY --chown=alice:alice alice.core.toml /usr/local/var/alice
RUN chmod 0600 /usr/local/var/alice/alice.core.toml

COPY --chown=alice:alice alice.cli.toml /usr/local/var/alice
RUN chmod 0600 /usr/local/var/alice/alice.cli.toml
