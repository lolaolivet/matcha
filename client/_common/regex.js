export const firstname = /^[a-zA-ZÀ-ÖØ-öø-ÿ]+(([',. -][a-zA-ZÀ-ÖØ-öø-ÿ ])?[a-zA-ZÀ-ÖØ-öø-ÿ]*){1,50}$/;
export const lastname = /^[a-zA-ZÀ-ÖØ-öø-ÿ]+(([',. -][a-zA-ZÀ-ÖØ-öø-ÿ ])?[a-zA-ZÀ-ÖØ-öø-ÿ]*){1,50}$/;
export const login = /^(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]|[\u0600-\u06FF]|[\u3041-\u3096\u309D-\u309F]|[À-ÖØ-öø-ÿ-]|[\w,.-]){1,50}$/; // emojis x6, arab, japonais
export const loginProhib = /(admin|paw)/gi;
export const name = /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*){1,50}$/;
export const gender = /^(male|female|other)$/;
export const email = /^([A-Za-z0-9._%-+-m&/=?^|~]|\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]|[\u0600-\u06FF]|[\u3041-\u3096\u309D-\u309F]|[À-ÖØ-öø-ÿ-])+@[A-Za-z0-9.-]+[.][A-Za-z]+$/;
export const password = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d]{8,50}$/;
