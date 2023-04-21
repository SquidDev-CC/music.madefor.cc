{
  description = "A ComputerCraft terminal renderer on the web";

  inputs.dream2nix.url = "github:nix-community/dream2nix";
  inputs.utils.url = "github:numtide/flake-utils";

  outputs = {self, dream2nix, nixpkgs, utils}:
    let
      name = "music.madefor.cc";
      mkOutputs = pkgs:
        let
          d2n = dream2nix.lib.init { inherit pkgs; config.projectRoot = ./.; };

          # Use dream2nix to generate our core package.
          outputs = d2n.dream2nix-interface.makeOutputs {
            source = ./.;
            settings = [{ subsystemInfo.nodejs = 18; }];
          };
          pkg = outputs.packages.default;
        in
        {
          devShells.default = outputs.devShells.default;

          packages."${name}-full" = pkg;
          packages.default = pkgs.stdenv.mkDerivation {
            inherit name;
            unpackPhase = ":";
            installPhase = ''
              mkdir -p $out/share
              cp -r ${pkg}/lib/node_modules/${name}/_build $out/share/${name}
            '';
          };
        };
    in utils.lib.eachDefaultSystem (system:
      let pkgs = import nixpkgs { inherit system; }; in
      mkOutputs pkgs
    ) // {
      checks = self.packages;
    };
}
