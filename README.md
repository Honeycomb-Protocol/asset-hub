# Asset Hub (The Composability Suite)
The Asset Hub is a set of suite tools for NFT and SFT Composability. Allowing projects to create and manage custom in-game assets for games and digital applications. The Asset Hub is designed to be modular and can be integrated directly with other programs in Honeycomb. Hive Control can be utilized to create engaging in-game experiences, such as player avatars that are linked with each unique user identify and managed through the master program.
## Assembler Program
The Assembler is designed to make it easy for developers to compose and manage in-game digital assets as NFTs. The program is designed using a block architecture for the computed logic. Developers can define variables within each block definition to generate dynamic blocks, enabling endless possibilities for digital asset creation. The Assembler also allows for simple dismantling of NFTs to be managed by the Asset Manager Program.
## Game Asset Manager Program
Assets that are managed as SFTs in the Game Asset Manager Program can be composed with the block compute logic from the NFT Assembler Program. 
The Game Asset Manager allows for developers to create and manage in-game assets, abilities, power-ups, and other player items. The program allows for the project to create more engaging and immersive experiences for players, enabling developers to create new NFTs, edit NFT traits, and enhance gameplay. An in-game asset marketplace can be built on top of Game Asset Manager, allowing players to trade, buy, and sell items within an in-game exchange.
## Game Token Manager Program
Game Token Manager enables developers to create and manage Solana Program Library Tokens (spl-tokens) within Honeycomb. The tokens created in this program can be used to create gated authorization for players and program specific token fee and reward structures.
Custodial tokens can also be created and managed in the Game Token Manager Program and can be easily utilized within Honeycomb programs. These tokens are for projects that require tokens that cannot be traded on traditional crypto exchanges. Custodial tokens are managed and stored on-chain with PDAs for each player, this data is retrieved through the Player Profiles on the maser program Hive Control.
## Paywall: Candy Guard Program
The Paywall: Candy Guard Program is a fork of Metaplex candy-guards used in the Candy Machine v3. The Paywall program adds a layer of custom configurations for managing marketplace actions (buying, selling, minting) of in-game assets. This program adds an additional layer of security and monetization to the Asset Hub Suite, to configure unique player actions with in-game tokens or assets.
