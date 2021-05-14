{
  description = "www.alexeyshmalko.com";

  outputs = { self, nixpkgs }: {
    devShell.x86_64-linux =
      let pkgs = nixpkgs.legacyPackages.x86_64-linux;
      in pkgs.mkShell {
        nativeBuildInputs = [
          pkgs.nodejs-14_x
          pkgs.awscli2
        ];
      };
  };
}
