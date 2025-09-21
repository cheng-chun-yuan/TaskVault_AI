import { NextResponse } from 'next/server'
import { zkVerifySession, Library, CurveType, ZkVerifyEvents } from 'zkverifyjs'

export async function POST(request: Request) {
  try {
    const { vkey, proof, publicSignals } = await request.json()

    // Validate required fields
    if (!vkey || !proof || !publicSignals) {
      return NextResponse.json(
        { error: 'Missing required fields: vkey, proof, publicSignals' },
        { status: 400 }
      )
    }

    // Get seed phrase from server environment (secure)
    const seedPhrase = process.env.ZKVERIFY_SEED_PHRASE
    if (!seedPhrase) {
      console.error('ZKVERIFY_SEED_PHRASE not configured in server environment')
      return NextResponse.json(
        { error: 'zkVerify service not configured' },
        { status: 500 }
      )
    }

    // Initialize zkVerify session with custom network configuration
    const session = await zkVerifySession.start()
      .Custom({
        websocket: "wss://testnet-rpc.zkverify.io",
        rpc: "https://testnet-rpc.zkverify.io"
      }) // Custom network
      .withAccount(seedPhrase); // Full session with a single active account

    try {
      // Submit proof for verification
      const { events } = await session.verify()
        .groth16({ 
          library: Library.snarkjs, 
          curve: CurveType.bn128 
        })
        .execute({
          proofData: {
            vk: vkey,
            proof: proof,
            publicSignals: publicSignals
          }
        })

      // Return a promise that resolves when proof is included in block
      const verificationResult = await new Promise<NextResponse>((resolve) => {
        // Set timeout for proof verification (5 minutes)
        const timeout = setTimeout(() => {
          session.close()
          resolve(NextResponse.json(
            { error: 'Proof verification timeout' },
            { status: 408 }
          ))
        }, 5 * 60 * 1000)

        // Handle successful inclusion in block
        events.on(ZkVerifyEvents.IncludedInBlock, (eventData) => {
          clearTimeout(timeout)
          console.log('Proof included in block:', eventData)
          
          session.close().then(() => {
            resolve(NextResponse.json({
              success: true,
              blockHash: eventData.blockHash,
              txHash: eventData.txHash,
              message: 'Proof verified and included in block'
            }))
          }).catch((closeError) => {
            console.error('Error closing zkVerify session:', closeError)
            resolve(NextResponse.json({
              success: true,
              blockHash: eventData.blockHash,
              txHash: eventData.txHash,
              message: 'Proof verified and included in block (session close warning)'
            }))
          })
        })

        // Handle any other events or errors that might occur
        // Note: Error event handling depends on zkVerify API updates
      })
      
      return verificationResult

    } catch (submitError) {
      console.error('Error submitting proof to zkVerify:', submitError)
      session.close()
      const errorMessage = submitError instanceof Error ? submitError.message : 'Unknown submission error'
      return NextResponse.json(
        { error: `Failed to submit proof: ${errorMessage}` },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('zkVerify API error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `zkVerify service error: ${errorMessage}` },
      { status: 500 }
    )
  }
}