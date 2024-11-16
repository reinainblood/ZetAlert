import { NextApiRequest, NextApiResponse } from 'next'

// Define the ZetaStatus type based on the expected incoming data
type ZetaStatus = {
    status: {
        indicator: 'none' | 'minor' | 'major' | 'critical',
        description: string
    },
    components: Array<{
        name: string,
        status: 'operational' | 'degraded_performance' | 'partial_outage' | 'major_outage'
    }>,
    incidents: Array<{
        id: string,
        name: string,
        status: string,
        impact: 'none' | 'minor' | 'major' | 'critical',
        message: string,
        updated_at: string
    }>
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const data: ZetaStatus = req.body


            console.log('Received webhook data:', data)

            // For now, we'll just log the received data
            // In a real application, you might want to store this in a database
            // or trigger other actions based on the received status

            res.status(200).json({ message: 'Webhook received successfully' })
        } catch (error) {
            console.error('Error processing webhook:', error)
            res.status(400).json({ message: 'Error processing webhook' })
        }
    } else {
        res.setHeader('Allow', ['POST'])
        res.status(405).end(`Method ${req.method} Not Allowed`)
    }
}