{
  description = "www.alexeyshmalko.com";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-22.11";
  inputs.flake-utils.url = "github:numtide/flake-utils";

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in {
        devShell = pkgs.mkShell {
          nativeBuildInputs = [
            pkgs.nodejs-18_x
            # pkgs.nodejs-16_x.pkgs.pnpm
          ];
        };
      });
  }
