{
  description = "oleksii.shmalko.com";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.11";
  inputs.flake-utils.url = "github:numtide/flake-utils";

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in {
        devShell = pkgs.mkShell {
          nativeBuildInputs = [
            pkgs.nodejs_22
            pkgs.nodejs_22.pkgs.pnpm
            # pkgs.nodejs-16_x.pkgs.pnpm

            pkgs.python3
          ];
        };
      });
  }
