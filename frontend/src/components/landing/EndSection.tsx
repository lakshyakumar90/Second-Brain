const EndSection=()=>{
    return(
        <div className="h-[150vh] px-10">
            <h1 className="text-[7vw] font-semibold">PRICING</h1>
            <h2 className="text-[3vw] font-semibold">Simple, Transparent Plans for Every Mind</h2>
            <p className="text-2xl mb-12">Whether you’re a solo learner, a creative professional, or a growing team, Mneumonicare has a plan to fit your needs. Start for free—upgrade any time, no hidden fees.</p>
            <div className="bg-red-200  h-100"></div>
            <div className="mt-10">
                <h2 className="text-2xl font-semibold">All Plans Include:</h2>
                <ol className="list-disc list-inside marker:text-xl text-xl">
                    <li>Multi-device sync</li>
                    <li >End-to-end encryption</li>
                    <li >Upgrades or downgrades anytime</li>
                    <li>Unlimited whiteboards and notes</li>
                </ol>
                <p className="text-xl">Free 14-day trial on all paid features, no credit card required.</p>
            </div>
        </div>
    )
}

export default EndSection;