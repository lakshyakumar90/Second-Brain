const HeroHeader = () => {
  return (
    <div className="flex items-center justify-center">
        <div className="flex items-center gap-2">
            <div className="bg-white rounded-full p-1 flex items-center justify-center">
              <img src="/dog-face.gif" className="h-10 object-cover rounded-full" alt="animated gif" />
            </div>
          <h1 className="text-2xl font-bold">Good Morning</h1>
        </div>
      </div>
  )
}

export default HeroHeader