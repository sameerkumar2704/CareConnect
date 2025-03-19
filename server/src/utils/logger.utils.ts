export const reqS = (message: string) => {
    console.log(`==============${message.toUpperCase()}==============`);
};

export const reqE = () => {
    console.log("==============REQEUST END==============");
};

export const reqER = (error: Error) => {
    console.log(`Error := ${error.message}`);
};
