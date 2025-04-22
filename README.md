# TaskVault AI

Project Description
TaskVault AI is an innovative platform designed to bridge Web2 social engagement with Web3 automation. It provides privacy-preserving identity verification, AI-powered evaluation, and blockchain-based reward distribution, ensuring effortless participation, instant rewards, and complete transparency.

Key Features Privacy-Preserving Identity Verification

Self Protocol: An on-chain registry securely stores verified identities using zero-knowledge verification (zkEmail). This ensures users maintain control of their data without exposing sensitive information.

Decentralized Identity Registry: Protects user privacy by eliminating the need for public wallet addresses or centralized storage.

AI-Powered Validation (ELIZA OS)

Tweet Content Analysis: ELIZA OS scans submissions for required hashtags and brand mentions using NLP models.

Sentiment Evaluation: NLP models assess the tone and emotion of submissions to ensure alignment with campaign goals.

Originality Verification: AI detects plagiarism and duplicate content to ensure high-quality submissions.

Engagement Prediction: Algorithms estimate potential reach and impact based on historical data.

Blockchain-Based Reward Distribution

Prize Pool Creation: Campaign creators lock funds into the Vault Contract, ensuring liquidity for rewards.

Automated Evaluation: ELIZA OS scores submissions based on predefined criteria, with results recorded immutably on-chain.

Instant Distribution: Smart contracts automatically transfer rewards to qualified participants without delays or intermediaries.

Transparency and Automation

All transactions are visible on-chain for auditability, ensuring trust and accountability.

Automation reduces manual validation needs by 90%, saving time and effort for campaign creators.

User Flow Campaign Creation: Brands define submission criteria (e.g., hashtags, mentions) and lock funds into a Vault Contract.

Participation: Users submit social media content (e.g., tweets) via TaskVault’s dApp interface, verified through zkEmail.

Evaluation: ELIZA OS evaluates submissions for compliance, originality, sentiment, and engagement potential. Scores are recorded immutably on-chain.

Reward Distribution: Smart contracts automatically transfer rewards to eligible participants based on their scores.

Project Creation Flow Funds are locked into the Prize Vault Contract to create the prize pool.

Campaign rules are set on-chain via TaskVaultCore.

Submissions are verified through SubmissionRegistry using zkEmail proofs.

ELIZA OS evaluates content and sends scores back on-chain for reward distribution.

Technical Benefits Transparency: All transactions are visible on-chain for full auditability.

Scalability: Supports large-scale campaigns with cross-chain compatibility.

Efficiency: Automated processes reduce manual workload by 90%.

How it's Made
Technical Architecture TaskVault AI combines zero-knowledge proofs, AI/ML models, and blockchain automation into a cohesive stack. Below are the core components:

Identity Verification Layer zkEmail Integration: Used zkEmail circuits to verify Twitter account ownership via password reset emails. Generate proof by email file and send it onchain to verify and connect address. Self Protocol: Deployed a decentralized identity registry on Ethereum (SubmissionRegistry) to store verification requirement All chain can have different verification config
AI Evaluation Layer (ELIZA OS) NLP Pipeline: Built with ElizaOS Framework and integrate with Twitter scraper to listen to and respond and send reward instantly on Tweeter Project can set their stylehash on chain and style to ai agent to prevent privacy and give judge different aspect to think and discuss
Blockchain & Smart Contracts Core Contracts: TaskVaultCore = "0x8441c3b1e6747605ab04e8a64f309bfba1fd37fe" SubmissionRegistry = "0x0ff023acedbf133b998c70dd73d7b54db926cd44" PrizeVault = "0xaf9048dca78acb1e4ea4a51af7b9e496a10c9e25" ERC20Mock = "0xa5839608ff9511b66ab177530bd508727ca3455a" Reward Distribution: Based on AI judge directly send point to user
Frontend & Integrations dApp Interface: Built with Next.js + TypeScript, using Privy for social login and wallet integration.
