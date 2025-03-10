
import { siteData } from '../../../data';


const Intro: React.FC = () => {
    

    return (
    <div className={` items-center flex-col justify-center h-screen flex`}>
        <div className='flex flex-col items-center justify-center'>
            <img src="/heartLogo.svg" alt="Heart Logo" className="intro-logo" />
            <h1 className='tracking-wider'>{siteData.title}</h1>
        </div>

        <a href='/home' className='p-3 px-5 mt-10 rounded-full cursor-pointer
        text-blue-500 bg-gray-100  hover:bg-blue-100 transition duration-100 active:scale-95 active:bg-opacity-70 ease-in-out'>
            Get Started </a>
    </div>
        
    );
};

export default Intro;