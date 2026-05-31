# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Solance backend (Rust / Axum) production image.
#
# Multi-stage build optimised for small runtime images and fast, cache-friendly
# rebuilds. We use `cargo-chef` so that the dependency graph is compiled and
# cached independently of the application source: editing `src/` does NOT
# invalidate the (expensive) dependency build layer, only the final crate is
# recompiled.
#
# The Rust toolchain is pinned to match the workspace (edition 2024 requires
# rustc >= 1.85; we pin the same minor used in local dev for reproducibility).
# ---------------------------------------------------------------------------

# Base image shared by the planning and build stages so the toolchain is
# identical across them. Debian "bookworm" is used so the runtime stage can be
# the matching `debian:bookworm-slim` (same glibc), avoiding linker surprises.
FROM rust:1.96-slim-bookworm AS chef
WORKDIR /app
# cargo-chef computes a dependency "recipe" that we can build in isolation.
# `--locked` ensures the installed version respects its own lockfile.
RUN cargo install cargo-chef --locked
# `pkg-config` is a common transitive build requirement for crates; keep the
# layer minimal and clean the apt cache to avoid bloating the image.
RUN apt-get update \
    && apt-get install -y --no-install-recommends pkg-config \
    && rm -rf /var/lib/apt/lists/*

# ---- Planner stage -------------------------------------------------------
# Produces `recipe.json`, a fingerprint of the dependency tree. This stage only
# needs the manifests, so it rarely changes and stays cached.
FROM chef AS planner
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

# ---- Builder stage -------------------------------------------------------
FROM chef AS builder
# Build (and cache) dependencies first using only the recipe. This layer is
# reused on every rebuild where Cargo.toml/Cargo.lock are unchanged.
COPY --from=planner /app/recipe.json recipe.json
RUN cargo chef cook --release --recipe-path recipe.json
# Now copy the real sources and compile only our crate. The `migrate!` macro
# embeds the SQL files from ./migrations into the binary at compile time, so the
# runtime image does not need the migrations directory.
COPY . .
RUN cargo build --release --locked --bin backend

# ---- Runtime stage -------------------------------------------------------
# Slim Debian image matching the builder's glibc. sqlx uses rustls (not system
# OpenSSL), so we only need CA certificates for outbound TLS (e.g. a managed
# Postgres requiring SSL). No build tools ship in the final image.
FROM debian:bookworm-slim AS runtime
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    # Run as an unprivileged user — never run the server as root in production.
    && groupadd --system app \
    && useradd --system --gid app --no-create-home app

# Copy only the compiled binary from the builder stage.
COPY --from=builder /app/target/release/backend /usr/local/bin/backend

USER app

# Documented listen port; the server binds 0.0.0.0:$PORT (defaults to 8080).
EXPOSE 8080

# Exec form so the binary is PID 1 and receives termination signals directly,
# enabling graceful shutdown by the orchestrator.
CMD ["backend"]
