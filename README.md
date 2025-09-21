# 🧠 TaskVault AI

**TaskVault AI** is an innovative platform that bridges Web2 social engagement with Web3 automation. It offers privacy-preserving identity verification, AI-powered content evaluation, and blockchain-based reward distribution, ensuring effortless participation, instant rewards, and complete transparency.

---

## 🚀 Key Features

### 🔐 Privacy-Preserving Identity Verification

- **Self Protocol**: An on-chain registry that securely stores verified identities using zero-knowledge proofs via zkEmail. This ensures users maintain control over their data without exposing sensitive information.

- **Decentralized Identity Registry**: Eliminates the need for public wallet addresses or centralized storage, enhancing user privacy.

### 🤖 AI-Powered Validation (ELIZA OS)

- **Tweet Content Analysis**: Utilizes NLP models to scan submissions for required hashtags and brand mentions.

- **Sentiment Evaluation**: Assesses the tone and emotion of submissions to ensure alignment with campaign goals.

- **Originality Verification**: Detects plagiarism and duplicate content to maintain high-quality submissions.

- **Engagement Prediction**: Estimates potential reach and impact based on historical data.

### 💰 Blockchain-Based Reward Distribution

- **Prize Pool Creation**: Campaign creators lock funds into the Vault Contract, ensuring liquidity for rewards.

- **Automated Evaluation**: ELIZA OS scores submissions based on predefined criteria, with results recorded immutably on-chain.

- **Instant Distribution**: Smart contracts automatically transfer rewards to qualified participants without delays or intermediaries.

### 🔍 Transparency and Automation

- **On-Chain Transparency**: All transactions are visible on-chain, ensuring auditability and trust.

- **Automation Efficiency**: Reduces manual validation needs by 90%, saving time and effort for campaign creators.

---

## 🧭 User Flow

1. **Campaign Creation**: Brands define submission criteria (e.g., hashtags, mentions) and lock funds into a Vault Contract.

2. **Participation**: Users submit social media content (e.g., tweets) via TaskVault’s dApp interface, verified through zkEmail.

3. **Evaluation**: ELIZA OS evaluates submissions for compliance, originality, sentiment, and engagement potential. Scores are recorded immutably on-chain.

4. **Reward Distribution**: Smart contracts automatically transfer rewards to eligible participants based on their scores.

---

## 🛠️ Technical Architecture

### 🔗 Identity Verification Layer

- **zkEmail Integration**: Utilizes zkEmail circuits to verify Twitter account ownership via password reset emails. Users generate proofs from email files and send them on-chain to verify and connect their addresses.

- **Self Protocol**: Deploys a decentralized identity registry on Ethereum (SubmissionRegistry) to store verification requirements. Each chain can have different verification configurations.

### 🤖 AI Evaluation Layer (ELIZA OS)

- **NLP Pipeline**: Built with the ElizaOS Framework, integrating with a Twitter scraper to monitor submissions and respond with instant rewards.

- **StyleHash Configuration**: Projects can set their stylehash on-chain to guide the AI agent's evaluation criteria, ensuring privacy and diverse judgment aspects.

### 🧱 Blockchain & Smart Contracts

- **Core Contracts**:
  - `TaskVaultCore`: `0x8441c3b1e6747605ab04e8a64f309bfba1fd37fe`
  - `SubmissionRegistry`: `0x0ff023acedbf133b998c70dd73d7b54db926cd44`
  - `PrizeVault`: `0xaf9048dca78acb1e4ea4a51af7b9e496a10c9e25`
  - `ERC20Mock`: `0xa5839608ff9511b66ab177530bd508727ca3455a`

- **Reward Distribution**: Based on AI evaluation, points are directly sent to users.

### 🌐 Frontend & Integrations

- **dApp Interface**: Built with Next.js and TypeScript, utilizing Privy for social login and wallet integration.

---

## 📈 Technical Benefits

- **Transparency**: All transactions are visible on-chain, ensuring full auditability.

- **Scalability**: Supports large-scale campaigns with cross-chain compatibility.

- **Efficiency**: Automated processes reduce manual workload by 90%.

---

## 🧪 How It's Made

**TaskVault AI** integrates zero-knowledge proofs, AI/ML models, and blockchain automation into a cohesive stack:

- **Identity Verification**: Combines zkEmail and Self Protocol for secure, privacy-preserving user authentication.

- **AI Evaluation**: ELIZA OS employs NLP and machine learning to assess content quality and relevance.

- **Blockchain Automation**: Smart contracts handle reward distribution, ensuring instant and transparent transactions.

- **Frontend Development**: A user-friendly dApp interface facilitates seamless interaction between users and the platform.

---

## 📚 Resources

- **ELIZA OS Whitepaper**: [arXiv: Eliza - A Web3 Friendly AI Agent Operating System](https://arxiv.org/html/2501.06781v1)

- **ETHGlobal Submission**: [TaskVault AI Showcase](https://ethglobal.com/showcase/taskvault-ai-ypts7)

---

For more information or to contribute to the project, please refer to the above resources or contact the development team.
