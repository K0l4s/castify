import React from 'react';
// import Podcast from '../../UI/podcast/Podcast';

const ProfileMainContent: React.FC = () => {
    return (
        <div>
            {/* cover user infor */}
            <div>
                <div className="flex flex-col items-center">
                    {/* banner image */}
                    <div className="w-full h-48 bg-gray-800 mb-4 shadow-xl">
                        <img className='w-full h-full object-cover object-center'
                            src="https://static.vecteezy.com/system/resources/previews/007/059/744/non_2x/live-streaming-podcast-banner-template-vector.jpg"
                            alt="banner" />
                    </div>
                    <div className="w-24 h-24 rounded-full bg-gray-600 mb-4 -mt-20">
                        <img className='w-full h-full object-cover object-center rounded-full'
                            src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                            alt="profile" />
                    </div>
                    <p className="text-center font-semibold">John Wick</p>
                    <p className="text-center text-gray-400">Location: Unknown</p>
                    {/* Add more user information as needed */}
                    <button className="mt-4 bg-blue-500 px-4 py-2 rounded">Follow</button>
                </div>
            </div>
            {/* <Podcast /> */}
        </div>
    );
};

export default ProfileMainContent;
