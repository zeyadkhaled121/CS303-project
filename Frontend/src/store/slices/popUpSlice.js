import {createSlice} from "@reduxjs/toolkit"
 
const popupSlice  = createSlice ({
    name :"popup" ,
    initialState : {
        settingPopup : false , 
        addBookPopup : false , 
        readBookPopup : false , 
        returnBookPopup : false , 
        recordBookgPopup : false , 
       AddNewAdminPopup : false , 

    },
    reducers: {
        toggleSettingPopup(state){
            state.settingPopup = !state.settingPopup;
        },
        toggleAddBookPopup(state){
            state. addBookPopup = !state. addBookPopup;
        },
        toggleReadBookPopup(state){
            state.readBookPopup = !state.readBookPopup;
        },
        toggleReturnBookPopup(state){
            state.returnBookPopup = !state.returnBookPopup;
        },
        toggleRecordBookgPopup(state){
            state.recordBookgPopup = !state.recordBookgPopup;
        },
        toggleAddNewAdminPopup(state){
            state.AddNewAdminPopup = !state.AddNewAdminPopup;
        },
        closeAllPopup(state){
            state.settingPopup = false ;
            state.AddNewAdminPopup = false ;
            state.returnBookPopup = false ;
            state.readBookPopup = false ;
            state.addBookPopup = false ;
            state.recordBookgPopup = false ;

        },

    }
});
export const{

    closeAllPopup,
    toggleAddBookPopup,
    toggleAddNewAdminPopup,   
    toggleReadBookPopup,   
    toggleRecordBookPopup,  
    toggleReturnBookPopup,
    toggleSettingPopup,
    
    } = popupSlice.actions;
    
    export default popupSlice.reducer;