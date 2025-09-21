import { NextResponse } from 'next/server'
import { zkVerifySession, Library, CurveType, ZkVerifyEvents } from 'zkverifyjs'
import { zkVerify } from '@/lib/env'

export async function POST(request: Request) {
  console.log('=== zkVerify Submit API Called ===')
  
  try {
    const requestBody = await request.json()
    
    const { vkey, proof, publicSignals } = requestBody
    
    // Validate required fields
    if (!vkey || !proof || !publicSignals) {
      console.log('❌ Missing required fields')
      return NextResponse.json(
        { error: 'Missing required fields: vkey, proof, publicSignals' },
        { status: 400 }
      )
    }

    // Get seed phrase from centralized config (secure)
    console.log('Checking environment variables...')
    const seedPhrase = zkVerify.seedPhrase
    if (!seedPhrase) {
      console.error('❌ ZKVERIFY_SEED_PHRASE not configured in server environment')
      return NextResponse.json(
        { error: 'zkVerify service not configured' },
        { status: 500 }
      )
    }
    console.log('✅ ZKVERIFY_SEED_PHRASE found')

    // Initialize zkVerify session with custom network configuration
    console.log('Initializing zkVerify session...')
    const session = await zkVerifySession.start()
      .Custom({
        websocket: "wss://testnet-rpc.zkverify.io",
        rpc: "https://testnet-rpc.zkverify.io"
      }) // Custom network
      .withAccount(seedPhrase); // Full session with a single active account
    
    console.log('✅ zkVerify session initialized successfully')

    try {
      // Submit proof for verification
      console.log('Submitting proof for verification...')
      
      const { events } = await session.verify()
        .groth16({ 
          library: Library.snarkjs, 
          curve: CurveType.bn128 
        })
        .execute({
          proofData: {
            vk: JSON.parse(vkey),
            proof: proof,
            publicSignals: publicSignals
          }
        })
      
      console.log('✅ Proof submitted successfully, waiting for events...')

      // Return a promise that resolves when proof is included in block
      const verificationResult = await new Promise<NextResponse>((resolve) => {
        console.log('Setting up event listeners...')
        
        // Set timeout for proof verification (5 minutes)
        const timeout = setTimeout(() => {
          console.log('⏰ Proof verification timeout (5 minutes)')
          session.close()
          resolve(NextResponse.json(
            { error: 'Proof verification timeout' },
            { status: 408 }
          ))
        }, 5 * 60 * 1000)
        
        console.log('⏱️ Timeout set for 5 minutes')

        // Handle successful inclusion in block
        events.on(ZkVerifyEvents.IncludedInBlock, (eventData) => {
          console.log('🎉 Proof included in block event received!')
          console.log('Event data:', eventData)
          clearTimeout(timeout)
          
          console.log('Closing zkVerify session...')
          session.close().then(() => {
            console.log('✅ Session closed successfully')
            resolve(NextResponse.json({
              success: true,
              blockHash: eventData.blockHash,
              txHash: eventData.txHash,
              message: 'Proof verified and included in block'
            }))
          }).catch((closeError) => {
            console.error('❌ Error closing zkVerify session:', closeError)
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
        console.log('📡 Event listeners configured, waiting for verification...')
      })
      
      return verificationResult

    } catch (submitError) {
      console.error('❌ Error submitting proof to zkVerify:', submitError)
      console.error('Error details:', {
        name: submitError instanceof Error ? submitError.name : 'Unknown',
        message: submitError instanceof Error ? submitError.message : 'Unknown submission error',
        stack: submitError instanceof Error ? submitError.stack : undefined
      })
      
      try {
        session.close()
        console.log('Session closed after error')
      } catch (closeError) {
        console.error('Error closing session after submit error:', closeError)
      }
      
      const errorMessage = submitError instanceof Error ? submitError.message : 'Unknown submission error'
      return NextResponse.json(
        { error: `Failed to submit proof: ${errorMessage}` },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('❌ zkVerify API error:', error)
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `zkVerify service error: ${errorMessage}` },
      { status: 500 }
    )
  }
}